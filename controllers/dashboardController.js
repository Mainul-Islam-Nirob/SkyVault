const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboard = async (req, res) => {
  try {
    const folderId = req.params.id || null;

    let folders, files, currentFolder = null;

    if (folderId) {
      // You're inside a specific folder
      currentFolder = await prisma.folder.findUnique({
        where: { id: folderId },
      });

      folders = await prisma.folder.findMany({
        where: { parentId: folderId, userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });

      files = await prisma.file.findMany({
        where: { folderId: folderId, userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });

    } else {
      // You're in the root (no parent folder)
      folders = await prisma.folder.findMany({
        where: { parentId: null, userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });

      files = await prisma.file.findMany({
        where: { folderId: null, userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.render('dashboard', {
      user: req.user,
      folders,
      files,
      currentFolder
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.render('dashboard', {
      user: req.user,
      folders: [],
      files: [],
      currentFolder: null
    });
  }
};
