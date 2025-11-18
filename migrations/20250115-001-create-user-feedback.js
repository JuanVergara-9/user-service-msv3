'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('user_feedback', {
      id: { type: S.BIGINT, autoIncrement: true, primaryKey: true },
      user_id: { type: S.INTEGER, allowNull: true }, // nullable para permitir anónimos
      type: { type: S.STRING(50), allowNull: false }, // 'bug', 'feature_request', 'complaint', 'other'
      subject: { type: S.STRING(200), allowNull: false },
      message: { type: S.TEXT, allowNull: false },
      status: { type: S.STRING(20), allowNull: false, defaultValue: 'pending' }, // 'pending', 'reviewed', 'resolved'
      ip: { type: S.STRING(45) },
      user_agent: { type: S.TEXT },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') }
    });
    await q.addIndex('user_feedback', ['user_id'], { name: 'user_feedback_user_id_idx' });
    await q.addIndex('user_feedback', ['status'], { name: 'user_feedback_status_idx' });
    await q.addIndex('user_feedback', ['created_at'], { name: 'user_feedback_created_at_idx' });
  },
  async down(q) { await q.dropTable('user_feedback'); }
};

