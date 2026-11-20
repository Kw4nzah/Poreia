// Expo default Metro config plus the .ltxt extension (liturgy texts are JSON asset files).
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('ltxt');

module.exports = config;
