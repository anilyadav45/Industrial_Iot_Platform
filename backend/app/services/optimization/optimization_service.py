from app.extensions import db

from app.models.cloud_resource import CloudResource
from app.models.optimization_recommendation import (
    OptimizationRecommendation
)


UNDER_UTILIZED_THRESHOLD = 20.0
HIGH_UTILIZATION_THRESHOLD = 80.0


def calculate_utilization(usage, capacity):
    """
    Convert resource usage into a percentage.

    Example:
        usage = 4
        capacity = 8
        result = 50.0
    """

    if capacity is None or capacity <= 0:
        return 0.0

    return round(
        (usage / capacity) * 100,
        2
    )


def classify_utilization(utilization):
    if utilization < UNDER_UTILIZED_THRESHOLD:
        return "UNDER_UTILIZED"

    if utilization > HIGH_UTILIZATION_THRESHOLD:
        return "HIGH_UTILIZATION"

    return "OPTIMAL"


def calculate_monthly_savings(
    resource,
    resource_type,
    utilization
):
    if resource_type == "CPU":
        capacity = resource.cpu_capacity

    elif resource_type == "MEMORY":
        capacity = resource.memory_capacity

    elif resource_type == "STORAGE":
        capacity = resource.storage_capacity

    elif resource_type == "NETWORK":
        capacity = resource.network_capacity

    else:
        return 0.0

    if utilization >= UNDER_UTILIZED_THRESHOLD:
        return 0.0

    unused_capacity = (
        capacity * (1 - utilization / 100)
    )

    estimated_cost_per_unit = {
        "CPU": 5.0,
        "MEMORY": 2.0,
        "STORAGE": 0.10,
        "NETWORK": 0.05
    }

    cost = estimated_cost_per_unit[resource_type]

    return round(
        unused_capacity * cost,
        2
    )


def get_existing_recommendation(
    resource_id,
    recommendation_type,
    title
):
    """
    Find an existing unresolved recommendation
    for the same resource and issue.

    This prevents duplicate recommendations
    when the same resource is analyzed repeatedly.
    """

    return (
        OptimizationRecommendation.query
        .filter(
            OptimizationRecommendation.resource_id == resource_id,
            OptimizationRecommendation.recommendation_type == recommendation_type,
            OptimizationRecommendation.title == title,
            OptimizationRecommendation.status.in_(
                ["PENDING", "ACKNOWLEDGED"]
            )
        )
        .order_by(
            OptimizationRecommendation.created_at.desc()
        )
        .first()
    )


def create_or_update_recommendation(
    resource,
    recommendation_type,
    severity,
    title,
    description,
    current_utilization,
    recommended_utilization,
    estimated_monthly_savings
):
    """
    Reuse an existing active recommendation instead
    of creating duplicates.
    """

    recommendation = get_existing_recommendation(
        resource_id=resource.id,
        recommendation_type=recommendation_type,
        title=title
    )

    if recommendation:

        recommendation.severity = severity

        recommendation.description = description

        recommendation.current_utilization = (
            current_utilization
        )

        recommendation.recommended_utilization = (
            recommended_utilization
        )

        recommendation.estimated_monthly_savings = (
            estimated_monthly_savings
        )

        return recommendation

    recommendation = OptimizationRecommendation(
        resource_id=resource.id,
        recommendation_type=recommendation_type,
        severity=severity,
        title=title,
        description=description,
        current_utilization=current_utilization,
        recommended_utilization=recommended_utilization,
        estimated_monthly_savings=estimated_monthly_savings,
        status="PENDING"
    )

    db.session.add(recommendation)

    return recommendation


def analyze_resource(resource_id):

    resource = CloudResource.query.get(
        resource_id
    )

    if not resource:
        raise ValueError(
            "Cloud resource not found"
        )

    # --------------------------------------------------
    # Calculate utilization correctly
    # --------------------------------------------------

    metrics = {
        "CPU": calculate_utilization(
            resource.current_cpu_usage,
            resource.cpu_capacity
        ),

        "MEMORY": calculate_utilization(
            resource.current_memory_usage,
            resource.memory_capacity
        ),

        "STORAGE": calculate_utilization(
            resource.current_storage_usage,
            resource.storage_capacity
        ),

        "NETWORK": calculate_utilization(
            resource.current_network_usage,
            resource.network_capacity
        )
    }

    # --------------------------------------------------
    # Classify each resource
    # --------------------------------------------------

    classifications = {
        resource_type: classify_utilization(
            utilization
        )
        for resource_type, utilization
        in metrics.items()
    }

    recommendations = []

    # --------------------------------------------------
    # Generate / reuse recommendations
    # --------------------------------------------------

    for resource_type, utilization in metrics.items():

        classification = classifications[
            resource_type
        ]

        # ----------------------------------------------
        # UNDER UTILIZED
        # ----------------------------------------------

        if classification == "UNDER_UTILIZED":

            savings = calculate_monthly_savings(
                resource,
                resource_type,
                utilization
            )

            title = (
                f"{resource_type} is under-utilized"
            )

            description = (
                f"{resource_type} utilization is "
                f"{utilization}%. Consider reducing "
                f"allocated {resource_type.lower()} "
                f"capacity."
            )

            recommendation = (
                create_or_update_recommendation(
                    resource=resource,
                    recommendation_type="RIGHTSIZING",
                    severity="INFO",
                    title=title,
                    description=description,
                    current_utilization=utilization,
                    recommended_utilization=50.0,
                    estimated_monthly_savings=savings
                )
            )

            recommendations.append(
                recommendation
            )

        # ----------------------------------------------
        # HIGH UTILIZATION
        # ----------------------------------------------

        elif classification == "HIGH_UTILIZATION":

            title = (
                f"{resource_type} utilization is high"
            )

            description = (
                f"{resource_type} utilization is "
                f"{utilization}%. Consider increasing "
                f"allocated {resource_type.lower()} "
                f"capacity."
            )

            recommendation = (
                create_or_update_recommendation(
                    resource=resource,
                    recommendation_type="SCALING",
                    severity="WARNING",
                    title=title,
                    description=description,
                    current_utilization=utilization,
                    recommended_utilization=70.0,
                    estimated_monthly_savings=0.0
                )
            )

            recommendations.append(
                recommendation
            )

    # --------------------------------------------------
    # Save changes
    # --------------------------------------------------

    db.session.commit()

    # --------------------------------------------------
    # Calculate savings from current analysis
    # --------------------------------------------------

    total_savings = round(
        sum(
            recommendation
            .estimated_monthly_savings
            for recommendation in recommendations
        ),
        2
    )

    return {
        "resource": resource,
        "metrics": metrics,
        "classifications": classifications,
        "recommendations": recommendations,
        "estimated_monthly_savings": total_savings
    }