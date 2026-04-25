const { AuditLog } = require('../models');

/**
 * Logs a system activity for audit traceability
 * @param {Object} params
 * @param {string} params.userId - UUID of the user performing action
 * @param {string} params.action - CREATE, UPDATE, DELETE, LOGIN, LOGOUT
 * @param {string} params.tableName - Affected table name
 * @param {string} params.recordId - UUID of the affected record
 * @param {Object} params.oldValue - JSON of previous state
 * @param {Object} params.newValue - JSON of new state
 * @param {string} params.ipAddress - Requesting IP
 */
const logActivity = async ({
  userId,
  action,
  tableName,
  recordId,
  oldValue = null,
  newValue = null,
  ipAddress = null
}) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action,
      table_name: tableName,
      record_id: recordId,
      old_value: oldValue,
      new_value: newValue,
      ip_address: ipAddress
    });
  } catch (error) {
    console.error('Audit Log Error:', error.message);
    // Don't throw error to avoid breaking main flow
  }
};

module.exports = { logActivity };
