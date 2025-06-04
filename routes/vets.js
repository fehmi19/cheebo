const express = require('express');
const Vet = require('../models/Vet');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les vétérinaires
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, ville, specialite, recherche, statut = 'verified' } = req.query;
    
    let query = { statut };
    
    if (ville && ville !== 'toutes') {
      query.ville = ville;
    }
    
    if (specialite && specialite !== 'toutes') {
      query.specialites = { $in: [specialite] };
    }
    
    if (recherche) {
      query.$or = [
        { nom: { $regex: recherche, $options: 'i' } },
        { ville: { $regex: recherche, $options: 'i' } },
        { specialites: { $in: [new RegExp(recherche, 'i')] } }
      ];
    }

    const veterinaires = await Vet.find(query)
      .sort({ note: -1, nombreAvis: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Vet.countDocuments(query);

    res.json({
      veterinaires,
      totalPages: Math.ceil(total / limit),
      pageActuelle: page,
      total
    });
  } catch (error) {
    console.error('Erreur récupération vétérinaires:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir un vétérinaire spécifique
router.get('/:id', async (req, res) => {
  try {
    const veterinaire = await Vet.findById(req.params.id);

    if (!veterinaire) {
      return res.status(404).json({ message: 'Vétérinaire non trouvé' });
    }

    res.json(veterinaire);
  } catch (error) {
    console.error('Erreur récupération vétérinaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter un avis pour un vétérinaire
router.post('/:id/avis', authMiddleware, async (req, res) => {
  try {
    const { note, commentaire } = req.body;
    const veterinaire = await Vet.findById(req.params.id);
    
    if (!veterinaire) {
      return res.status(404).json({ message: 'Vétérinaire non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà donné un avis
    const avisExistant = veterinaire.avis.find(
      avis => avis.utilisateur.toString() === req.user._id.toString()
    );

    if (avisExistant) {
      return res.status(400).json({ message: 'Vous avez déjà donné un avis' });
    }

    const nouvelAvis = {
      utilisateur: req.user._id,
      nomUtilisateur: req.user.nom,
      note,
      commentaire
    };

    veterinaire.avis.push(nouvelAvis);
    veterinaire.calculerNoteMoyenne();
    await veterinaire.save();

    res.status(201).json({
      message: 'Avis ajouté',
      avis: nouvelAvis,
      noteMoyenne: veterinaire.note
    });
  } catch (error) {
    console.error('Erreur ajout avis:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
