'use strict';
const bcrypt = require('bcrypt');
const saltRounds = 10;
module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  up: async (queryInterface, Sequelize) => {
    // Hash passwords before seeding
    const hashedPassword1 = await bcrypt.hash('password1', saltRounds);
    const hashedPassword2 = await bcrypt.hash('password2', saltRounds);

    await queryInterface.bulkInsert('Users', [ // Make sure 'Users' matches your actual table name
      {
        username: 'username1',
        password: hashedPassword1, // Use the hashed password
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'username2',
        password: hashedPassword2, // Use the hashed password
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Users', null, {}); 
  }
};
