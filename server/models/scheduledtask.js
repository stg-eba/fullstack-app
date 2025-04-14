'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ScheduledTask extends Model {
    static associate(models) {
      // TaskLogとの関連付け (1対多)
      ScheduledTask.hasMany(models.TaskLog, {
        foreignKey: 'taskId',
        as: 'logs', // 関連付けのエイリアス
        onDelete: 'CASCADE', // タスク削除時にログも削除
      });
    }
  }
  ScheduledTask.init({
    name: { // タスク名 (一意)
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    cronSchedule: { // cronスケジュール文字列
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: { // タスクの状態
      type: DataTypes.ENUM('idle', 'running', 'completed', 'failed', 'retrying'),
      defaultValue: 'idle',
      allowNull: false,
    },
    lastRunAt: DataTypes.DATE, // 最終実行日時
    nextRunAt: DataTypes.DATE, // 次回実行予定日時
    lastLogMessage: DataTypes.TEXT // 最新のログメッセージ（概要表示用）
  }, {
    sequelize,
    modelName: 'ScheduledTask',
    // tableName: 'ScheduledTasks' // 必要に応じてテーブル名を指定
  });
  return ScheduledTask;
};