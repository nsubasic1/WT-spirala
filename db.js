const Sequelize = require("sequelize");
const sequelize = new Sequelize("wt2118620","root","root",{host:"localhost",dialect:"mysql"});
const db={};

db.Sequelize = Sequelize;  
db.sequelize = sequelize;

db.vjezba = require('./vjezba.js')(sequelize);
db.zadatak = require('./zadatak.js')(sequelize);
db.student = require('./student.js')(sequelize);
db.grupa = require('./grupa.js')(sequelize);


db.vjezba.hasMany(db.zadatak, {as: 'zadaci'})
db.student.belongsTo(db.grupa)
module.exports=db;