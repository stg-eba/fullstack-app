'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TaskLog extends Model {
    static associate(models) {

      TaskLog.belongsTo(models.ScheduledTask, {
        foreignKey: 'taskId',
        as: 'task', 
      });
    }
  }
  TaskLog.init({
    taskId: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ScheduledTasks', 
        key: 'id',
      },
    },
    level: { 
      type: DataTypes.ENUM('info', 'error', 'warn'),
      allowNull: false,
    },
    message: { 
      type: DataTypes.TEXT,
      allowNull: false,
    },

  }, {
    sequelize,
    modelName: 'TaskLog',
    //updatedAt: false, 
  });
  return TaskLog;
};
