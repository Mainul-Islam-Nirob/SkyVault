const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboard = async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      include: { files: true },
      orderBy: { createdAt: 'desc' }
    });
     console.log('✅ Dashboard accessed by:', req.user?.email);

    res.render('dashboard', {
      user: req.user,
      folders
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.render('dashboard', {
      user: req.user,
      folders: []
    });
  }
};
