const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.listFolders = async (req, res) => {
  const folders = await prisma.folder.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });
  res.render('folders/list', { folders, user: req.user });
  
};

exports.showCreateForm = (req, res) => {
  res.render('folders/new');
};

exports.createFolder = async (req, res) => {
  const { name } = req.body;
  await prisma.folder.create({
    data: { name, userId: req.user.id }
  });
  res.redirect('/folders');
};

exports.showEditForm = async (req, res) => {
  const folder = await prisma.folder.findUnique({
    where: { id: req.params.id }
  });
  if (!folder || folder.userId !== req.user.id) return res.status(403).send('Forbidden');
  res.render('folders/edit', { folder });
};

exports.updateFolder = async (req, res) => {
  const { name } = req.body;
  const folder = await prisma.folder.findUnique({ where: { id: req.params.id } });
  if (!folder || folder.userId !== req.user.id) return res.status(403).send('Forbidden');

  await prisma.folder.update({
    where: { id: req.params.id },
    data: { name }
  });
  res.redirect('/folders');
};

exports.deleteFolder = async (req, res) => {
  const folder = await prisma.folder.findUnique({ where: { id: req.params.id } });
  if (!folder || folder.userId !== req.user.id) return res.status(403).send('Forbidden');

  await prisma.folder.delete({ where: { id: req.params.id } });
  res.redirect('/folders');
};

exports.showNestedForm = (req, res) => {
  res.render('folders/nested', { parentId: req.params.id });
};

exports.createNestedFolder = async (req, res) => {
  const { name } = req.body;
  const parentId = req.params.id;

  await prisma.folder.create({
    data: {
      name,
      parentId,
      userId: req.user.id
    }
  });

  res.redirect(`/folders/${parentId}`);
};

exports.viewFolder = async (req, res) => {
  const folder = await prisma.folder.findUnique({
    where: { id: req.params.id },
    include: {
      files: true,
      subfolders: {
        include: { files: true }
      }
    }
  });

  if (!folder || folder.userId !== req.user.id) return res.status(403).send('Forbidden');

  res.render('folders/view', {
    currentFolder: folder,            
    subfolders: folder.subfolders,    
    files: folder.files,              
    user: req.user
  });
};

// Show form to upload file to root (no folder)
exports.showRootUploadForm = (req, res) => {
  res.render('folders/upload', { folder: null, user: req.user });
};

// Show form to upload file to a specific folder
exports.showFolderUploadForm = async (req, res) => {
  const folderId = req.params.id;

  try {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder || folder.userId !== req.user.id) {
      return res.status(403).send('Forbidden');
    }

    res.render('folders/upload', { folder, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(400).send('Invalid folder ID');
  }
};


exports.uploadFile = async (req, res) => {
  if (!req.file) {
    console.error('❌ No file uploaded');
    return res.status(400).send('No file uploaded.');
  }

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

