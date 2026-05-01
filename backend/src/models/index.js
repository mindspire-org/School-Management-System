import { Sequelize, DataTypes } from 'sequelize';
import { connectionDetails } from '../config/db.js';
import bcrypt from 'bcryptjs';

import InventoryModelsInit from './Inventory.js';
import ReceptionModelsInit from './Reception.js';
import CardManagementModelsInit from './CardManagement.js';
import EventsCertificatesModelsInit from './EventsCertificates.js';
import HumanResourceModelsInit from './HumanResource.js';

let sequelize;

if (connectionDetails && connectionDetails.url) {
  sequelize = new Sequelize(connectionDetails.url, {
    dialect: 'postgres',
    logging: false,
    define: { schema: 'public' },
    searchPath: 'public',
    dialectOptions: connectionDetails.ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  });
} else {
  // Fallback or error if no connection string
  console.warn("No database connection string detected for Sequelize.");
  sequelize = new Sequelize({
    dialect: 'postgres',
    logging: false
  });
}

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: true, unique: true },
    username: { type: DataTypes.STRING, allowNull: true, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'student' },
    campus_id: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: 'users',
    timestamps: false,
    defaultScope: { attributes: { exclude: ['password_hash'] } },
    scopes: { withPassword: { attributes: { include: ['password_hash'] } } },
  }
);

User.addHook('beforeCreate', async (user) => {
  if (user.password_hash) {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});
User.addHook('beforeUpdate', async (user) => {
  if (user.changed('password_hash')) {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

const Student = sequelize.define(
  'Student',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    class: { type: DataTypes.STRING },
    section: { type: DataTypes.STRING },
  },
  { tableName: 'students', timestamps: false }
);

const Teacher = sequelize.define(
  'Teacher',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    department: { type: DataTypes.STRING },
  },
  { tableName: 'teachers', timestamps: false }
);

const Assignment = sequelize.define(
  'Assignment',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    due_date: { type: DataTypes.DATE, allowNull: true },
    class: { type: DataTypes.STRING, allowNull: true },
    section: { type: DataTypes.STRING, allowNull: true },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
  },
  { tableName: 'assignments', timestamps: false }
);

// Associations
Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Teacher.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Assignment.belongsTo(User, { foreignKey: 'created_by', as: 'teacher' });

// Initialize module models
const InventoryModels = InventoryModelsInit(sequelize);
const ReceptionModels = ReceptionModelsInit(sequelize);
const CardManagementModels = CardManagementModelsInit(sequelize);
const EventsCertificatesModels = EventsCertificatesModelsInit(sequelize);
const HumanResourceModels = HumanResourceModelsInit(sequelize);

async function initDb() {
  try {
    await sequelize.authenticate();
    // Sync all models including the new ones
    await sequelize.sync();

    // Best-effort schema fix: older deployments may have Leave.leaveType as a Postgres ENUM.
    // Convert it to VARCHAR so new leave type strings (e.g., Marriage Leave) can be stored.
    // This is safe to run multiple times.
    try {
      await sequelize.query(
        'ALTER TABLE leaves ALTER COLUMN "leaveType" TYPE VARCHAR(80) USING "leaveType"::text'
      );
    } catch (_) {
      // ignore (column may not exist or already converted)
    }
    try {
      await sequelize.query(
        'ALTER TABLE leaves ALTER COLUMN leave_type TYPE VARCHAR(80) USING leave_type::text'
      );
    } catch (_) {
      // ignore
    }

    try {
      const [rows] = await sequelize.query("SELECT current_database() AS db");
      const db = rows?.[0]?.db;
      console.log(`PostgreSQL connected and models synced via Sequelize (db=${db || 'unknown'})`);
    } catch (_) {
      console.log('PostgreSQL connected and models synced via Sequelize');
    }
  } catch (error) {
    console.error('Sequelize connection error:', error);
  }
}

export {
  sequelize,
  initDb,
  User,
  Student,
  Teacher,
  Assignment,
};

// Re-export all models from modules
export const { Product, Category, Store, Supplier, Unit, Purchase, Sale, Issue } = InventoryModels;
export const { AdmissionEnquiry, PostalRecord, CallLog, VisitorLog, Complaint, ReceptionConfig } = ReceptionModels;
export const { IdCardTemplate, GeneratedIdCard, AdmitCardTemplate, GeneratedAdmitCard } = CardManagementModels;
export const { Event, Certificate, CertificateTemplate, IssuedCertificate, QRAttendance, QRAttendanceSession } = EventsCertificatesModels;
export const { Payroll, AdvanceSalary, Leave, Award } = HumanResourceModels;
