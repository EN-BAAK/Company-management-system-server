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
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      work_type: {
        type: DataTypes.STRING,
        allowNull: false,
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
        {
          fields: ["personal_id"],
          name: "personal_id_index",
        },
      ],
      tableName: "users",
      timestamps: false,
      hooks: {
        beforeCreate: async (user, options) => {
          if (user.password) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            user.password = hashedPassword;
          }
        },
        beforeUpdate: async (user, options) => {
          if (user.password) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            user.password = hashedPassword;
          }
        },
      },
    }
  );

  return User;
};
