'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
        Todo.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    }

  }
  Todo.init({
    userId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    completed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Todo',
  });
  return Todo;
};