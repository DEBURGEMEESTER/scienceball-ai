"use client";

import React from 'react';
import styles from './AttributeGrid.module.css';

interface Attribute {
    name: string;
    value: number;
}

interface AttributeGridProps {
    technical: Attribute[];
    mental: Attribute[];
    physical: Attribute[];
}

const AttributeGrid: React.FC<AttributeGridProps> = ({ technical, mental, physical }) => {
    const getAttrClass = (value: number) => {
        if (value >= 19) return styles.elite;
        if (value >= 15) return styles.high;
        if (value >= 10) return styles.mid;
        return styles.low;
    };

    const renderColumn = (title: string, attributes: any) => (
        <div className={styles.column}>
            <h3 className={styles.columnTitle}>{title}</h3>
            <div className={styles.attrList}>
                {Array.isArray(attributes) ? attributes.map(attr => (
                    <div key={attr.name} className={styles.attrRow}>
                        <span className={styles.attrName}>{attr.name}</span>
                        <span className={`${styles.attrValue} ${getAttrClass(attr.value)}`}>
                            {attr.value}
                        </span>
                    </div>
                )) : <p className={styles.noData}>Intelligence data missing</p>}
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            {renderColumn('Technical', technical)}
            {renderColumn('Mental', mental)}
            {renderColumn('Physical', physical)}
        </div>
    );
};

export default AttributeGrid;
