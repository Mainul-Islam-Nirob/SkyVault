const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.showUploadForm = async (req, res) => {
  const folderId = req.params.id || null;
  let folder = null;

  if (folderId) {
    folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: { user: true }
    });

    if (!folder || folder.userId !== req.user.id) return res.status(403).send('Forbidden');
  }

  res.render('files/upload', { folder, user: req.user });
};

exports.uploadFile = async (req, res) => {
  const { originalname, size, path: filePath } = req.file;

  await prisma.file.create({
    data: {
      name: originalname,
      size: size,
      url: `/uploads/${path.basename(filePath)}`,
      userId: req.user.id
    }
  });

  res.redirect('/dashboard');
};

exports.uploadToFolder = async (req, res) => {
  const folderId = req.params.id;
  const folder = await prisma.folder.findUnique({ where: { id: folderId } });

  if (!folder || folder.userId !== req.user.id) return res.status(403).send('Forbidden');

  const { originalname, size, path: filePath } = req.file;

  await prisma.file.create({
    data: {
      name: originalname,
      size: size,
      url: `/uploads/${path.basename(filePath)}`,
      folderId,
      userId: req.user.id
    }
  });

  res.redirect(`/folders/${folderId}`);
};
