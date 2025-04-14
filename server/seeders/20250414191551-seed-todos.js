'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Todos', [{
      userId: 1,
      title: 'Learn Express',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId: 1,
      title: 'Implement JWT Auth',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Todos', null, {});
  }
};
