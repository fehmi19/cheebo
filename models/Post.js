const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  contenu: {
    type: String,
    required: [true, 'Le contenu est requis'],
    trim: true
  },
  auteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nomAuteur: {
    type: String,
    required: true
  },
  imageAuteur: {
    type: String,
    default: '/users/default.jpg'
  },
  imageAnimal: {
    type: String,
    default: ''
  },
  typeContenu: {
    type: String,
    enum: ['image', 'video', 'text'],
    default: 'text'
  },
  urlVideo: {
    type: String,
    default: ''
  },
  likes: {
    type: Number,
    default: 0
  },
  utilisateursAiment: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  commentaires: [{
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    nomUtilisateur: {
      type: String,
      required: true
    },
    imageUtilisateur: {
      type: String,
      default: '/users/default.jpg'
    },
    texte: {
      type: String,
      required: true
    },
    dateCreation: {
      type: Date,
      default: Date.now
    }
  }],
  statut: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateModification: {
    type: Date,
    default: Date.now
  }
});

postSchema.pre('save', function(next) {
  this.dateModification = Date.now();
  next();
});

module.exports = mongoose.model('Post', postSchema);
