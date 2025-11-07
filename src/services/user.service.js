const dayjs=require('dayjs');
const { UserProfile } = require('../../models');
const { badRequest } = require('../utils/httpError');

function isAdult(dateStr){
  if(!dateStr) return true;
  const dob=dayjs(dateStr); if(!dob.isValid()) return false;
  return dayjs().diff(dob,'year') >= 18;
}

async function getOrCreateProfile(userId){
  let p = await UserProfile.findOne({ where:{ user_id:userId } });
  if(!p) p = await UserProfile.create({ user_id:userId });
  return p;
}

async function updateProfile(userId, payload){
  if(payload.date_of_birth && !isAdult(payload.date_of_birth)) {
    throw badRequest('USER.UNDERAGE','Debes ser mayor de 18 años');
  }
  const p = await getOrCreateProfile(userId);
  const fields = [
    'first_name','last_name','date_of_birth','province','city','locality','address',
    'phone_e164','avatar_url','public_profile','default_location_source'
  ];
  fields.forEach(f => (payload[f] === undefined) && delete payload[f]);
  await p.update(payload);
  return p;
}

async function setAvatar(userId, avatar) {
  const p = await getOrCreateProfile(userId);
  await p.update({
    avatar_url: avatar.url
  });
  return p;
}

async function clearAvatar(userId) {
  const p = await getOrCreateProfile(userId);
  await p.update({ avatar_url: null });
  return p;
}

module.exports={ getOrCreateProfile, updateProfile, setAvatar, clearAvatar };
