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


exports.viewSharedFolder = async (req, res) => {
  const { uuid } = req.params;
  const folderId = req.query.folder || null;

  const shared = await prisma.sharedFolder.findUnique({
    where: { id: uuid },
    include: { folder: true },
  });

  if (!shared || new Date() > shared.expiresAt) {
    return res.status(404).render('error', { message: 'Link expired or invalid.' });
  }

  // Determine which folder to show
  const currentFolder = folderId
    ? await prisma.folder.findUnique({ where: { id: folderId } })
    : shared.folder;

  if (!currentFolder) {
    return res.status(404).render('error', { message: 'Folder not found.' });
  }

  // Validate that currentFolder is a descendant of shared.folder
  let isValid = false;
  let temp = currentFolder;
  while (temp) {
    if (temp.id === shared.folderId) {
      isValid = true;
      break;
    }
    temp = await prisma.folder.findUnique({
      where: { id: temp.parentId || '' },
    });
  }

  if (!isValid) {
    return res.status(403).render('error', { message: 'Access denied to this folder.' });
  }

  const subfolders = await prisma.folder.findMany({
    where: { parentId: currentFolder.id },
  });

  const files = await prisma.file.findMany({
    where: { folderId: currentFolder.id },
  });

  // Build breadcrumbs
  const breadcrumbs = [];
  let node = currentFolder;
  while (node) {
    breadcrumbs.unshift(node);
    node = await prisma.folder.findUnique({
      where: { id: node.parentId || '' },
    });
  }

  res.render('shared-view', {
    sharedId: uuid,
    folder: currentFolder,
    subfolders,
    files,
    breadcrumbs,
    expiresAt: shared.expiresAt,
  });
};

