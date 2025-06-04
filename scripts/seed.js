// scripts/seed.js - Script pour données de test Cheebo
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Pet = require('../models/Pet');
const Vet = require('../models/Vet');
const Product = require('../models/Product');
const Order = require('../models/Order');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`🟢 MongoDB connecté: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('🚀 Début du seeding Cheebo...');
    
    // Connexion à la base de données
    await connectDB();

    // Nettoyer les données existantes
    console.log('🧹 Nettoyage des collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (let collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({});
      console.log(`   ✅ ${collection.name} nettoyée`);
    }

    // Créer utilisateur admin
    console.log('👑 Création de l\'admin...');
    const admin = new User({
      nom: 'Admin Cheebo',
      email: 'admin@cheebo.com',
      motDePasse: 'admin123',
      role: 'admin',
      avatar: '/users/admin.jpg'
    });
    await admin.save();

    // Créer utilisateurs test
    console.log('👥 Création des utilisateurs...');
    const user1 = new User({
      nom: 'Jean Dupont',
      email: 'jean@example.com',
      motDePasse: 'password123',
      avatar: '/users/user_1.jpg'
    });
    await user1.save();

    const user2 = new User({
      nom: 'Marie Martin',
      email: 'marie@example.com',
      motDePasse: 'password123',
      avatar: '/users/user_2.jpg'
    });
    await user2.save();

    const user3 = new User({
      nom: 'Thomas Bernard',
      email: 'thomas@example.com',
      motDePasse: 'password123',
      avatar: '/users/user_3.jpg'
    });
    await user3.save();

    // Créer des animaux
    console.log('🐕 Création des animaux...');
    const pets = [
      {
        nom: 'Rex',
        proprietaire: user1._id,
        espece: 'chien',
        race: 'Golden Retriever',
        age: 3,
        genre: 'male',
        couleur: 'Doré',
        poids: 25,
        taille: 'grand',
        sterilise: true,
        vaccine: true,
        puces: false,
        identifiant: 'CH-2024-001',
        description: 'Chien très gentil et joueur, adore les enfants',
        image: '/pets/rex.jpg',
        coordonneesContact: {
          telephone: '98123456',
          email: 'jean@example.com',
          adresse: '123 Rue de la Paix, Tunis'
        }
      },
      {
        nom: 'Luna',
        proprietaire: user2._id,
        espece: 'chat',
        race: 'Persan',
        age: 2,
        genre: 'femelle',
        couleur: 'Blanc',
        poids: 4,
        taille: 'moyen',
        sterilise: true,
        vaccine: true,
        puces: true,
        identifiant: 'CT-2024-002',
        description: 'Chatte très calme et affectueuse',
        image: '/pets/luna.jpg',
        coordonneesContact: {
          telephone: '98654321',
          email: 'marie@example.com',
          adresse: '456 Avenue Bourguiba, Ben Arous'
        }
      },
      {
        nom: 'Milo',
        proprietaire: user3._id,
        espece: 'lapin',
        race: 'Nain',
        age: 1,
        genre: 'male',
        couleur: 'Gris',
        poids: 1.5,
        taille: 'petit',
        sterilise: false,
        vaccine: true,
        puces: false,
        identifiant: 'LP-2024-003',
        description: 'Lapin très actif qui adore jouer',
        image: '/pets/milo.jpg',
        statut: 'disponible'
      }
    ];
    
    const createdPets = await Pet.insertMany(pets);
    console.log(`   ✅ ${createdPets.length} animaux créés`);

    // Créer des vétérinaires
    console.log('🩺 Création des vétérinaires...');
    const vets = [
      {
        nom: 'Dr. Mouna Boukadi',
        email: 'dr.mouna@vetclinic.com',
        telephone: '98356535',
        adresse: '123 Avenue Habib Bourguiba, Ben Arous',
        ville: 'Ben Arous',
        specialites: ['Médecine Générale', 'Chirurgie'],
        numeroLicence: 'VET-TN-2020-001',
        experience: 8,
        formation: 'École Nationale de Médecine Vétérinaire de Sidi Thabet',
        langues: ['Français', 'Arabe', 'Anglais'],
        horaires: {
          lundi: '09:00 - 17:00',
          mardi: '09:00 - 17:00',
          mercredi: '09:00 - 17:00',
          jeudi: '09:00 - 17:00',
          vendredi: '09:00 - 15:00',
          samedi: 'Fermé',
          dimanche: '09:00 - 15:00'
        },
        note: 4.8,
        nombreAvis: 22,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6Kqt6vs7YvZXCB-7NpouY4jDPLdClHA4NrA&s',
        statut: 'verified'
      },
      {
        nom: 'Dr. Ahmed Ben Salem',
        email: 'dr.ahmed@petcare.tn',
        telephone: '22123456',
        adresse: '45 Rue de la Liberté, Tunis',
        ville: 'Tunis',
        specialites: ['Dermatologie', 'Cardiologie'],
        numeroLicence: 'VET-TN-2019-045',
        experience: 12,
        formation: 'Université de Tunis, École de Médecine Vétérinaire',
        langues: ['Français', 'Arabe'],
        horaires: {
          lundi: '24h',
          mardi: '09:00 - 17:00',
          mercredi: '09:00 - 17:00',
          jeudi: '09:00 - 17:00',
          vendredi: '09:00 - 15:00',
          samedi: 'Fermé',
          dimanche: '09:00 - 15:00'
        },
        note: 4.2,
        nombreAvis: 15,
        statut: 'verified'
      }
    ];

    const createdVets = await Vet.insertMany(vets);
    console.log(`   ✅ ${createdVets.length} vétérinaires créés`);

    // Créer des produits
    console.log('🛍️ Création des produits...');
    const products = [
      {
        nom: 'Croquettes Premium pour Chien',
        description: 'Croquettes haut de gamme pour chiens adultes de toutes races. Enrichies en vitamines et minéraux pour une santé optimale.',
        prix: 49.99,
        ancienPrix: 59.99,
        categorie: 'Nourriture',
        marque: 'Royal Canin',
        stock: 15,
        images: ['https://ik.imagekit.io/yynn3ntzglc/france/production/catalog/products/001005/1.jpg'],
        poids: '2kg',
        typeAnimal: ['chien'],
        note: 4.8,
        nombreAvis: 124
      },
      {
        nom: 'Croquettes Premium pour Chat',
        description: 'Croquettes haut de gamme pour chats adultes. Formulées pour maintenir une peau saine et un pelage brillant.',
        prix: 39.99,
        ancienPrix: 49.99,
        categorie: 'Nourriture',
        marque: 'Royal Canin',
        stock: 20,
        images: ['https://ik.imagekit.io/yynn3ntzglc/france/production/catalog/products/001005/2.jpg'],
        poids: '1.5kg',
        typeAnimal: ['chat'],
        note: 4.7,
        nombreAvis: 90
      },
      {
        nom: 'Jouet Corde pour Chien',
        description: 'Jouet en corde naturelle, parfait pour le jeu et le nettoyage des dents.',
        prix: 15.99,
        categorie: 'Jouets',
        marque: 'Kong',
        stock: 30,
        images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'],
        poids: '200g',
        typeAnimal: ['chien'],
        note: 4.5,
        nombreAvis: 45
      },
      {
        nom: 'Litière Chat Naturelle',
        description: 'Litière naturelle absorbante et anti-odeurs.',
        prix: 12.99,
        ancienPrix: 15.99,
        categorie: 'Soins',
        marque: 'Catsan',
        stock: 25,
        images: ['https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400'],
        poids: '10L',
        typeAnimal: ['chat'],
        note: 4.3,
        nombreAvis: 67
      },
      {
        nom: 'Collier Ajustable pour Chien',
        description: 'Collier confortable et ajustable pour chiens de toutes tailles.',
        prix: 19.99,
        categorie: 'Accessoires',
        marque: 'PetSafe',
        stock: 40,
        images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400'],
        typeAnimal: ['chien'],
        note: 4.4,
        nombreAvis: 33
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`   ✅ ${createdProducts.length} produits créés`);

    // Créer des posts
    console.log('📝 Création des posts...');
    const posts = [
      {
        contenu: 'Belle journée au parc avec Rex ! Il adore courir après les écureuils. 🐕🌳',
        auteur: user1._id,
        nomAuteur: 'Jean Dupont',
        imageAuteur: '/users/user_1.jpg',
        imageAnimal: '/pets/pet_1.webp',
        typeContenu: 'image',
        likes: 42,
        commentaires: [
          {
            utilisateur: user2._id,
            nomUtilisateur: 'Marie Martin',
            imageUtilisateur: '/users/user_2.jpg',
            texte: 'Il a l\'air tellement heureux ! 😊',
            dateCreation: new Date('2024-02-15')
          }
        ]
      },
      {
        contenu: 'Première visite chez le vétérinaire pour Luna aujourd\'hui. Tout va bien ! 🏥✅',
        auteur: user2._id,
        nomAuteur: 'Marie Martin',
        imageAuteur: '/users/user_2.jpg',
        imageAnimal: '/pets/pet_2.jpeg',
        typeContenu: 'image',
        likes: 28,
        commentaires: [
          {
            utilisateur: user1._id,
            nomUtilisateur: 'Jean Dupont',
            imageUtilisateur: '/users/user_1.jpg',
            texte: 'C\'est important de faire des contrôles réguliers !',
            dateCreation: new Date('2024-02-16')
          }
        ]
      },
      {
        contenu: 'Nouvel arrivant dans la famille ! Voici Milo, notre petit lapin de 6 mois. 🐰💕',
        auteur: user3._id,
        nomAuteur: 'Thomas Bernard',
        imageAuteur: '/users/user_3.jpg',
        imageAnimal: '/pets/pet_3.jpg',
        typeContenu: 'image',
        likes: 56
      }
    ];

    const createdPosts = await Post.insertMany(posts);
    console.log(`   ✅ ${createdPosts.length} posts créés`);

    // Créer quelques commandes
    console.log('🛒 Création des commandes...');
    const orders = [
      {
        utilisateur: user1._id,
        articles: [
          {
            produit: createdProducts[0]._id,
            quantite: 2,
            prix: 49.99
          },
          {
            produit: createdProducts[2]._id,
            quantite: 1,
            prix: 15.99
          }
        ],
        total: 115.97,
        statut: 'delivered',
        adresseLivraison: {
          nom: 'Jean Dupont',
          telephone: '98123456',
          adresse: '123 Rue de la Paix',
          ville: 'Tunis',
          codePostal: '1000'
        },
        methodePaiement: 'cash',
        dateCommande: new Date('2024-01-10'),
        dateLivraison: new Date('2024-01-15')
      }
    ];

    const createdOrders = await Order.insertMany(orders);
    console.log(`   ✅ ${createdOrders.length} commandes créées`);

    // Afficher le résumé
    console.log('');
    console.log('🎉 =====================================');
    console.log('✅ DONNÉES DE TEST CRÉÉES AVEC SUCCÈS !');
    console.log('🎉 =====================================');
    console.log('');
    
    console.log('🔐 COMPTES CRÉÉS :');
    console.log('   👑 Admin: admin@cheebo.com / admin123');
    console.log('   👤 User1: jean@example.com / password123');
    console.log('   👤 User2: marie@example.com / password123');
    console.log('   👤 User3: thomas@example.com / password123');
    console.log('');
    
    console.log('📊 STATISTIQUES :');
    console.log(`   👥 ${await User.countDocuments()} utilisateurs`);
    console.log(`   🐕 ${await Pet.countDocuments()} animaux`);
    console.log(`   🩺 ${await Vet.countDocuments()} vétérinaires`);
    console.log(`   🛍️ ${await Product.countDocuments()} produits`);
    console.log(`   📝 ${await Post.countDocuments()} posts`);
    console.log(`   🛒 ${await Order.countDocuments()} commandes`);
    console.log('');
    
    console.log('🚀 Le backend Cheebo est prêt !');
    console.log('   👉 Démarrez le serveur avec: npm run dev');
    console.log('   👉 API disponible sur: http://localhost:5000/api');
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Fermer la connexion proprement
    await mongoose.connection.close();
    console.log('🔴 Connexion MongoDB fermée');
    process.exit(0);
  }
};

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Exception non capturée:', err.message);
  process.exit(1);
});

// Exécuter le seeding
if (require.main === module) {
  seedData();
}

module.exports = { seedData, connectDB };