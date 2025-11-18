'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('UserFeedback', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true }, // nullable para permitir anónimos
    type: { type: DataTypes.STRING(50), allowNull: false }, // 'bug', 'feature_request', 'complaint', 'other'
    subject: { type: DataTypes.STRING(200), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pending' }, // 'pending', 'reviewed', 'resolved'
    ip: DataTypes.STRING(45),
    user_agent: DataTypes.TEXT
  }, { tableName: 'user_feedback', underscored: true });
};

