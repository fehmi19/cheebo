const mongoose = require('mongoose');

const vetSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true
  },
  telephone: {
    type: String,
    required: [true, 'Le téléphone est requis']
  },
  adresse: {
    type: String,
    required: [true, 'L\'adresse est requise']
  },
  ville: {
    type: String,
    required: [true, 'La ville est requise']
  },
  specialites: [{
    type: String,
    enum: ['Médecine Générale', 'Chirurgie', 'Dermatologie', 'Cardiologie', 'Ophtalmologie', 'Dentaire', 'Urgences']
  }],
  numeroLicence: {
    type: String,
    required: [true, 'Le numéro de licence est requis'],
    unique: true
  },
  experience: {
    type: Number,
    min: 0
  },
  formation: {
    type: String,
    trim: true
  },
  langues: [{
    type: String,
    enum: ['Français', 'Arabe', 'Anglais', 'Allemand', 'Espagnol']
  }],
  horaires: {
    lundi: { type: String, default: 'Fermé' },
    mardi: { type: String, default: 'Fermé' },
    mercredi: { type: String, default: 'Fermé' },
    jeudi: { type: String, default: 'Fermé' },
    vendredi: { type: String, default: 'Fermé' },
    samedi: { type: String, default: 'Fermé' },
    dimanche: { type: String, default: 'Fermé' }
  },
  note: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  nombreAvis: {
    type: Number,
    default: 0
  },
  avis: [{
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    nomUtilisateur: {
      type: String,
      required: true
    },
    note: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    commentaire: {
      type: String,
      trim: true
    },
    dateCreation: {
      type: Date,
      default: Date.now
    }
  }],
  image: {
    type: String,
    default: '/vets/default.jpg'
  },
  statut: {
    type: String,
    enum: ['pending', 'verified', 'suspended', 'rejected'],
    default: 'pending'
  },
  dateInscription: {
    type: Date,
    default: Date.now
  }
});

// Calculer la note moyenne après chaque ajout d'avis
vetSchema.methods.calculerNoteMoyenne = function() {
  if (this.avis.length === 0) {
    this.note = 0;
    this.nombreAvis = 0;
  } else {
    const somme = this.avis.reduce((acc, avis) => acc + avis.note, 0);
    this.note = somme / this.avis.length;
    this.nombreAvis = this.avis.length;
  }
};

module.exports = mongoose.model('Vet', vetSchema);
