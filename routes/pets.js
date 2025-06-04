const express = require('express');
const Pet = require('../models/Pet');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les animaux (pour adoption)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, espece, statut = 'disponible', recherche } = req.query;
    
    let query = { statut };
    
    if (espece && espece !== 'tous') {
      query.espece = espece;
    }
    
    if (recherche) {
      query.$or = [
        { nom: { $regex: recherche, $options: 'i' } },
        { race: { $regex: recherche, $options: 'i' } },
        { description: { $regex: recherche, $options: 'i' } }
      ];
    }

    const animaux = await Pet.find(query)
      .populate('proprietaire', 'nom email')
      .sort({ dateCreation: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Pet.countDocuments(query);

    res.json({
      animaux,
      totalPages: Math.ceil(total / limit),
      pageActuelle: page,
      total
    });
  } catch (error) {
    console.error('Erreur récupération animaux:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir les animaux de l'utilisateur connecté
router.get('/mes-animaux', authMiddleware, async (req, res) => {
  try {
    const animaux = await Pet.find({ proprietaire: req.user._id })
      .sort({ dateCreation: -1 });

    res.json(animaux);
  } catch (error) {
    console.error('Erreur récupération mes animaux:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter un nouvel animal
router.post('/', authMiddleware, async (req, res) => {
  try {
    const animalData = {
      ...req.body,
      proprietaire: req.user._id
    };

    const nouvelAnimal = new Pet(animalData);
    await nouvelAnimal.save();

    res.status(201).json({
      message: 'Animal ajouté avec succès',
      animal: nouvelAnimal
    });
  } catch (error) {
    console.error('Erreur ajout animal:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout' });
  }
});

// Obtenir un animal spécifique
router.get('/:id', async (req, res) => {
  try {
    const animal = await Pet.findById(req.params.id)
      .populate('proprietaire', 'nom email telephone');

    if (!animal) {
      return res.status(404).json({ message: 'Animal non trouvé' });
    }

    res.json(animal);
  } catch (error) {
    console.error('Erreur récupération animal:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour un animal
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const animal = await Pet.findOne({
      _id: req.params.id,
      proprietaire: req.user._id
    });

    if (!animal) {
      return res.status(404).json({ message: 'Animal non trouvé ou non autorisé' });
    }

    Object.assign(animal, req.body);
    await animal.save();

    res.json({
      message: 'Animal mis à jour',
      animal
    });
  } catch (error) {
    console.error('Erreur mise à jour animal:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;