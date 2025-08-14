const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.deleteFile = async (req, res) => {
  const fileId = req.params.id;

  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!file || file.userId !== req.user.id) {
      return res.status(403).send('Forbidden');
    }

    // Delete from Cloudinary 
   if (file.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(file.cloudinaryPublicId);
    }


    await prisma.file.delete({
      where: { id: fileId }
    });

    res.redirect('/folders'); 
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).send('Internal Server Error');
  }
};

exports.downloadFile = async (req, res) => {
  const fileId = req.params.id;

  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!file || file.userId !== req.user.id) {
      return res.status(403).send('Forbidden');
    }

    return res.redirect(file.url);


  } catch (err) {
    console.error('Error downloading file:', err);
    res.status(500).send('Internal Server Error');
  }
};