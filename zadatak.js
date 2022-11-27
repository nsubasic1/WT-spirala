const Sequelize = require("sequelize");
 
module.exports = function (sequelize, DataTypes) {
    const Zadatak = sequelize.define("Zadatak", {
       id : {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey : true,
       }
   });
   return Zadatak;
}
