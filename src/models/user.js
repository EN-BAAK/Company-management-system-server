const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      personal_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      notes: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM("admin", "worker"),
        allowNull: false,
        defaultValue: "worker",
      },
    },
    {
      indexes: [
        {
          fields: ["fullName"],
          name: "full_name_index",
        },
      ],
      tableName: "users",
      timestamps: false,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const hashedPassword = await bcrypt.hash(
              user.password,
              parseInt(process.env.SALT)
            );
            user.password = hashedPassword;
          }
        },
      },
    }
  );

  return User;
};
