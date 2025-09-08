import AuditLog from "../models/AuditLog.js"


export const logAction = async (user, action, target, before, after) => {
  await AuditLog.create({
    user,
    action,
    target,
    dataBefore: before,
    dataAfter: after
  });
};
