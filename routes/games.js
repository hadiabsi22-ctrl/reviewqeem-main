const express = require('express');
const GameLocal = require('../models/GameLocal');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all games
router.get('/', async (req, res) => {
  try {
    const { search, genre, platform } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre) {
      query.genre = genre;
    }

    if (platform) {
      query.platforms = { $in: [platform] };
    }

    const games = await GameLocal.find(query)
      .sort({ createdAt: -1 })
      ;

    res.json({
      success: true,
      games,
      count: games.length
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الألعاب'
    });
  }
});

// Get single game
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let query;
    
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: id };
    } else {
      query = { slug: id };
    }

    const game = await GameLocal.findOne(query);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'اللعبة غير موجودة'
      });
    }

    res.json({
      success: true,
      game
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب اللعبة'
    });
  }
});

// Create game (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const game = new GameLocal(req.body);
    await game.save();

    res.status(201).json({
      success: true,
      message: 'تم إنشاء اللعبة بنجاح',
      game
    });
  } catch (error) {
    console.error('Error creating game:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'اللعبة موجودة بالفعل'
      });
    }
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء اللعبة',
      error: error.message
    });
  }
});

// Update game (admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    const game = await GameLocal.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'اللعبة غير موجودة'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث اللعبة بنجاح',
      game
    });
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث اللعبة',
      error: error.message
    });
  }
});

// Delete game (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const game = await GameLocal.findByIdAndDelete(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'اللعبة غير موجودة'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف اللعبة بنجاح'
    });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف اللعبة'
    });
  }
});

module.exports = router;
