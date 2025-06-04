const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  proprietaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  espece: {
    type: String,
    required: [true, 'L\'espèce est requise'],
    enum: ['chien', 'chat', 'oiseau', 'lapin', 'autre']
  },
  race: {
    type: String,
    trim: true
  },
  age: {
    type: Number,
    min: 0
  },
  dateNaissance: {
    type: Date
  },
  genre: {
    type: String,
    enum: ['male', 'femelle'],
    required: true
  },
  couleur: {
    type: String,
    trim: true
  },
  poids: {
    type: Number,
    min: 0
  },
  taille: {
    type: String,
    enum: ['petit', 'moyen', 'grand']
  },
  sterilise: {
    type: Boolean,
    default: false
  },
  vaccine: {
    type: Boolean,
    default: false
  },
  puces: {
    type: Boolean,
    default: false
  },
  identifiant: {
    type: String,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  statut: {
    type: String,
    enum: ['disponible', 'adopte', 'perdu', 'trouve'],
    default: 'disponible'
  },
  coordonneesContact: {
    telephone: String,
    email: String,
    adresse: String
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Pet', petSchema);
