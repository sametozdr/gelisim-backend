const errorHandler = (err, req, res, next) => {
  console.error('Server Global Error:', err.message);

  let status = err.status || 500;
  let message = err.message || 'Sunucu içi bir hata oluştu';

  // Sequelize / PostgreSQL validation & constraint extraction
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    status = 400;
    message = err.errors.map(e => e.message).join(', ');
  } else if (err.parent && err.parent.detail) {
    status = 400;
    message = err.parent.detail; // Example: "Key (email)=(...) already exists."
  }

  res.status(status).json({
    success: false,
    message,
    errors: err.errors || []
  });
};

module.exports = errorHandler;
