const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Inscription
router.post('/inscription', async (req, res) => {
  try {
    const { nom, email, motDePasse } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const utilisateurExistant = await User.findOne({ email });
    if (utilisateurExistant) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Créer nouvel utilisateur
    const nouvelUtilisateur = new User({
      nom,
      email,
      motDePasse
    });

    await nouvelUtilisateur.save();

    // Générer token JWT
    const token = jwt.sign(
      { userId: nouvelUtilisateur._id },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      utilisateur: {
        id: nouvelUtilisateur._id,
        nom: nouvelUtilisateur.nom,
        email: nouvelUtilisateur.email,
        role: nouvelUtilisateur.role
      }
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
});

// Connexion
router.post('/connexion', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Trouver l'utilisateur
    const utilisateur = await User.findOne({ email });
    if (!utilisateur) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Vérifier le mot de passe
    const motDePasseValide = await utilisateur.comparePassword(motDePasse);
    if (!motDePasseValide) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Générer token JWT
    const token = jwt.sign(
      { userId: utilisateur._id },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

// Obtenir profil utilisateur
router.get('/profil', authMiddleware, async (req, res) => {
  try {
    res.json({
      utilisateur: {
        id: req.user._id,
        nom: req.user.nom,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        dateCreation: req.user.dateCreation
      }
    });
  } catch (error) {
    console.error('Erreur profil:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
});

module.exports = router;
