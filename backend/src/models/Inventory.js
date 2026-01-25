import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Product = sequelize.define('Product', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        code: { type: DataTypes.STRING, allowNull: false, unique: true },
        name: { type: DataTypes.STRING, allowNull: false },
        category: { type: DataTypes.STRING, allowNull: false },
        unit: { type: DataTypes.STRING, allowNull: false },
        quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
        minStock: { type: DataTypes.INTEGER, defaultValue: 10 },
        price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        store: { type: DataTypes.STRING },
        description: { type: DataTypes.TEXT },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'products', timestamps: true });

    const Category = sequelize.define('Category', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'categories', timestamps: true });

    const Store = sequelize.define('Store', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        location: { type: DataTypes.STRING },
        capacity: { type: DataTypes.STRING },
        inCharge: { type: DataTypes.STRING },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'stores', timestamps: true });

    const Supplier = sequelize.define('Supplier', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        contact: { type: DataTypes.STRING },
        email: { type: DataTypes.STRING },
        address: { type: DataTypes.TEXT },
        paymentTerms: { type: DataTypes.STRING },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'suppliers', timestamps: true });

    const Unit = sequelize.define('Unit', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        symbol: { type: DataTypes.STRING, allowNull: false },
        conversionRate: { type: DataTypes.DECIMAL(10, 2), defaultValue: 1 },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'units', timestamps: true });

    const Purchase = sequelize.define('Purchase', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        date: { type: DataTypes.DATE, allowNull: false },
        supplierId: { type: DataTypes.STRING, allowNull: false, field: 'supplier' },
        productId: { type: DataTypes.STRING, allowNull: false, field: 'product' },
        quantity: { type: DataTypes.INTEGER, allowNull: false },
        unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        status: { type: DataTypes.ENUM('Pending', 'Completed', 'Cancelled'), defaultValue: 'Pending' },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'purchases', timestamps: true });

    const Sale = sequelize.define('Sale', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        date: { type: DataTypes.DATE, allowNull: false },
        customer: { type: DataTypes.STRING, allowNull: false },
        productId: { type: DataTypes.STRING, allowNull: false, field: 'product' },
        quantity: { type: DataTypes.INTEGER, allowNull: false },
        unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        status: { type: DataTypes.ENUM('Pending', 'Paid', 'Cancelled'), defaultValue: 'Pending' },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'sales', timestamps: true });

    const Issue = sequelize.define('Issue', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        date: { type: DataTypes.DATE, allowNull: false },
        department: { type: DataTypes.STRING, allowNull: false },
        productId: { type: DataTypes.STRING, allowNull: false, field: 'product' },
        quantity: { type: DataTypes.INTEGER, allowNull: false },
        issuedTo: { type: DataTypes.STRING, allowNull: false },
        purpose: { type: DataTypes.TEXT },
        status: { type: DataTypes.ENUM('Issued', 'Returned'), defaultValue: 'Issued' },
        returnDate: { type: DataTypes.DATE },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'issues', timestamps: true });

    return { Product, Category, Store, Supplier, Unit, Purchase, Sale, Issue };
};
