const Sequelize = require("sequelize");
 
module.exports = function (sequelize, DataTypes) {
    const Vjezba = sequelize.define("Vjezba", {
       brojZadataka : Sequelize.INTEGER
   });
   return Vjezba;
}
