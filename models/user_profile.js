'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('UserProfile', {
    id: { type: DataTypes.INTEGER, autoIncrement:true, primaryKey:true },
    user_id: { type: DataTypes.INTEGER, allowNull:false, unique:true },
    first_name: DataTypes.STRING(60),
    last_name: DataTypes.STRING(60),
    date_of_birth: DataTypes.DATEONLY,
    province: DataTypes.STRING(80),
    city: DataTypes.STRING(80),
    locality: DataTypes.STRING(80),
    address: DataTypes.STRING(160),
    phone_e164: DataTypes.STRING(32),
    avatar_url: DataTypes.STRING(255),
    public_profile: { type: DataTypes.BOOLEAN, defaultValue:true },
    default_location_source: { type: DataTypes.STRING(10), defaultValue:'city' }
  }, { tableName:'user_profiles', underscored:true });
};
