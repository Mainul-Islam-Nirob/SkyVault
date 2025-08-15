const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Show the share form page
exports.showShareForm = async (req, res) => {
  const { id } = req.params;

  const folder = await prisma.folder.findUnique({
    where: { id },
  });

  if (!folder) return res.status(404).render('error', { message: 'Folder not found.' });

  const shared = await prisma.sharedFolder.findFirst({
    where: { folderId: id },
    orderBy: { createdAt: 'desc' }, 
  });

  const files = await prisma.file.findMany({
    where: { folderId: id },
  });

  res.render('share-form', {
    folder,
    files,
    expiresAt: shared?.expiresAt || null,
    sharedLink: shared || null, 
    req
  });
};

// Generate shareable link
exports.generateShareLink = async (req, res) => {
  const { id } = req.params;
  const { duration } = req.body;

  const expiresAt = new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000);

  const shared = await prisma.sharedFolder.create({
    data: {
      folderId: id,
      expiresAt,
    },
  });

  const folder = await prisma.folder.findUnique({ where: { id } });
  const files = await prisma.file.findMany({ where: { folderId: id } });

  res.render('share-form', {
    folder,
    files,
    sharedLink: shared,
    req
  });
};

// Public view of shared folder
exports.viewSharedFolder = async (req, res) => {
  const { uuid } = req.params;

  const shared = await prisma.sharedFolder.findUnique({
    where: { id: uuid },
    include: { folder: true },
  });

  if (!shared || new Date() > shared.expiresAt) {
    return res.status(404).render('error', { message: 'Link expired or invalid.' });
  }

  const files = await prisma.file.findMany({
    where: { folderId: shared.folderId },
  });

  res.render('shared-folder', {
    folder: shared.folder,
    files,
    expiresAt: shared.expiresAt,
  });
};

