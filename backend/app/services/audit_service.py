from app.extensions import db
from app.models.audit_log import AuditLog


def create_audit_log(
    user_id=None,
    action=None,
    resource_type=None,
    resource_id=None,
    description=None,
    ip_address=None
):
    """
    Create an audit log entry.

    This function only creates the log object.
    The caller controls the transaction commit.
    """

    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        description=description,
        ip_address=ip_address
    )

    db.session.add(audit_log)

    return audit_log