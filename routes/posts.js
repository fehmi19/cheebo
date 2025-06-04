const express = require('express');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les posts (feed)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, statut = 'approved' } = req.query;
    
    const posts = await Post.find({ statut })
      .populate('auteur', 'nom email avatar')
      .sort({ dateCreation: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments({ statut });

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      pageActuelle: page,
      total
    });
  } catch (error) {
    console.error('Erreur récupération posts:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer un nouveau post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { contenu, imageAnimal, typeContenu, urlVideo } = req.body;

    const nouveauPost = new Post({
      contenu,
      auteur: req.user._id,
      nomAuteur: req.user.nom,
      imageAuteur: req.user.avatar,
      imageAnimal,
      typeContenu,
      urlVideo
    });

    await nouveauPost.save();
    await nouveauPost.populate('auteur', 'nom email avatar');

    res.status(201).json({
      message: 'Post créé avec succès',
      post: nouveauPost
    });
  } catch (error) {
    console.error('Erreur création post:', error);
    res.status(500).json({ message: 'Erreur lors de la création' });
  }
});

// Liker/Unliker un post
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    const utilisateurIndex = post.utilisateursAiment.indexOf(req.user._id);
    
    if (utilisateurIndex > -1) {
      // Unlike
      post.utilisateursAiment.splice(utilisateurIndex, 1);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like
      post.utilisateursAiment.push(req.user._id);
      post.likes += 1;
    }

    await post.save();

    res.json({
      likes: post.likes,
      isLiked: utilisateurIndex === -1
    });
  } catch (error) {
    console.error('Erreur like/unlike:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter un commentaire
router.post('/:id/commentaires', authMiddleware, async (req, res) => {
  try {
    const { texte } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    const commentaire = {
      utilisateur: req.user._id,
      nomUtilisateur: req.user.nom,
      imageUtilisateur: req.user.avatar,
      texte
    };

    post.commentaires.push(commentaire);
    await post.save();

    res.status(201).json({
      message: 'Commentaire ajouté',
      commentaire
    });
  } catch (error) {
    console.error('Erreur ajout commentaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
