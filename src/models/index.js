const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const db = {};

const sequelize = new Sequelize({
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  username: process.env.USERNAME,
  password: process.env.DATABASE_PASSWORD,
  dialect: "mysql",
  port: 3306,
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
});

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.Shift.belongsTo(db.User, {
  foreignKey: "workerId",
  onDelete: "SET NULL",
  name: "worker_id_foreign_key",
  as: "worker",
});

db.User.hasMany(db.Shift, {
  foreignKey: "workerId",
  onDelete: "SET NULL",
  as: "shifts",
});

db.Shift.belongsTo(db.Company, {
  foreignKey: "companyId",
  onDelete: "CASCADE",
  name: "company_id_foreign_key",
  as: "company",
});

db.Company.hasMany(db.Shift, {
  foreignKey: "companyId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  as: "shifts",
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
