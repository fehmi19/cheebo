// routes/tasks.js - Routes tâches
const express = require('express');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Obtenir toutes les tâches de l'utilisateur
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { statut, priorite, page = 1, limit = 10 } = req.query;
    
    let query = { utilisateur: req.user._id };
    
    if (statut) query.statut = statut;
    if (priorite) query.priorite = priorite;

    const taches = await Task.find(query)
      .populate('utilisateur', 'nom email')
      .sort({ dateModification: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      taches,
      totalPages: Math.ceil(total / limit),
      pageActuelle: page,
      total
    });
  } catch (error) {
    console.error('Erreur récupération tâches:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer une nouvelle tâche
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { titre, description, priorite, dateEcheance } = req.body;

    const nouvelleTache = new Task({
      titre,
      description,
      priorite,
      dateEcheance,
      utilisateur: req.user._id
    });

    await nouvelleTache.save();
    await nouvelleTache.populate('utilisateur', 'nom email');

    res.status(201).json({
      message: 'Tâche créée avec succès',
      tache: nouvelleTache
    });
  } catch (error) {
    console.error('Erreur création tâche:', error);
    res.status(500).json({ message: 'Erreur lors de la création' });
  }
});

// Obtenir une tâche spécifique
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const tache = await Task.findOne({
      _id: req.params.id,
      utilisateur: req.user._id
    }).populate('utilisateur', 'nom email');

    if (!tache) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    res.json(tache);
  } catch (error) {
    console.error('Erreur récupération tâche:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour une tâche
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { titre, description, statut, priorite, dateEcheance } = req.body;

    const tache = await Task.findOneAndUpdate(
      { _id: req.params.id, utilisateur: req.user._id },
      { titre, description, statut, priorite, dateEcheance },
      { new: true, runValidators: true }
    ).populate('utilisateur', 'nom email');

    if (!tache) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    res.json({
      message: 'Tâche mise à jour avec succès',
      tache
    });
  } catch (error) {
    console.error('Erreur mise à jour tâche:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
});

// Supprimer une tâche
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const tache = await Task.findOneAndDelete({
      _id: req.params.id,
      utilisateur: req.user._id
    });

    if (!tache) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression tâche:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
});

module.exports = router;