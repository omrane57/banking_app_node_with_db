'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      user.hasMany(models.account,{foreignKey:'user_id',as:'account'})

      // define association here
    }
  }
  user.init({
    name: DataTypes.STRING,
    age: DataTypes.STRING,
    gender: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN,
    username:DataTypes.STRING,
    password:DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user',
    underscored: true,
    paranoid:true
  });
  return user;
};