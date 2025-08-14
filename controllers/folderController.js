const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cloudinary = require('../config/cloudinary');

exports.listFolders = async (req, res) => {
  const folders = await prisma.folder.findMany({
    where: {
      userId: req.user.id,
      parentId: null
    },
    include: {
      files: true
    }
  });

  const files = await prisma.file.findMany({
    where: {
      userId: req.user.id,
      folderId: null
    }
  });

  res.render('dashboard', {
    currentFolder: null,
    folders: folders,
    subfolders: [], 
    files: files,
    user: req.user
  });
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

async function deleteFolderRecursive(folderId, userId) {
  await prisma.file.deleteMany({
    where: { folderId, userId }
  });

  const subfolders = await prisma.folder.findMany({
    where: { parentId: folderId, userId },
    select: { id: true }
  });

  for (const sub of subfolders) {
    await deleteFolderRecursive(sub.id, userId);
  }

  await prisma.folder.delete({
    where: { id: folderId }
  });
}

exports.deleteFolder = async (req, res) => {
  const folderId = req.params.id;

  if (!folderId || typeof folderId !== 'string') {
    return res.status(400).send('Invalid folder ID');
  }

  try {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId } 
    });

    if (!folder || folder.userId !== req.user.id) {
      return res.status(403).send('Forbidden');
    }

    await deleteFolderRecursive(folderId, req.user.id);
    res.redirect('/folders');
  } catch (err) {
    console.error('Error deleting folder:', err);
    res.status(500).send('Internal Server Error');
  }
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

  res.render('dashboard', {
    currentFolder: folder,
    folders: [], 
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
  if (!req.file) return res.status(400).send('No file uploaded.');

  const folderId = req.params.id || null;
  let folder = null;

  if (folderId) {
    folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder || folder.userId !== req.user.id) {
      return res.status(403).send('Forbidden');
    }
  }

  try {
    const folderPath = folder ? `sky-vault/${folder.name.replace(/[^a-zA-Z0-9-_]/g, '_')}` : 'sky-vault/root';

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: folderPath,
      resource_type: 'auto'
    });

    await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        url: result.secure_url,
        cloudinaryPublicId: result.public_id,
        folderId: folderId,
        userId: req.user.id
      }
    });

    res.redirect(folderId ? `/folders/${folderId}` : '/folders');
  } catch (err) {
    console.error('Unified upload error:', err);
    res.status(500).send('Upload failed');
  }
};


// exports.uploadFile = async (req, res) => {
//   if (!req.file) return res.status(400).send('No file uploaded.');

//   const { originalname, size } = req.file;
//   const fileUrl = req.file.path;

//   await prisma.file.create({
//     data: {
//       name: originalname,
//       size: size,
//       url: fileUrl,
//       cloudinaryPublicId: fileUrl.public_id,
//       userId: req.user.id
//     }
//   });

//   res.redirect('/dashboard');
// };


// exports.uploadFile = async (req, res) => {
//   if (!req.file) return res.status(400).send('No file uploaded.');

//   try {
//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: 'sky-vault/root',
//       resource_type: 'auto' 
//     });

//     await prisma.file.create({
//       data: {
//         name: req.file.originalname,
//         size: req.file.size,
//         url: result.secure_url,
//         cloudinaryPublicId: result.public_id,
//         userId: req.user.id
//       }
//     });

//     res.redirect('/folders');
//   } catch (err) {
//     console.error('Upload error:', err);
//     res.status(500).send('Upload failed');
//   }
// };


// exports.uploadToFolder = async (req, res) => {
//   const folderId = req.params.id;
//   const folder = await prisma.folder.findUnique({ where: { id: folderId } });

//   if (!folder || folder.userId !== req.user.id) return res.status(403).send('Forbidden');

//   const { originalname, size } = req.file;
//   const fileUrl = req.file.path;

//   await prisma.file.create({
//     data: {
//       name: originalname,
//       size: size,
//       url: fileUrl,
//       cloudinaryPublicId: fileUrl.public_id,
//       folderId,
//       userId: req.user.id
//     }
//   });

//   res.redirect(`/folders/${folderId}`);
// };

