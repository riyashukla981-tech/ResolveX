// src/components/complaints/StatusBadge.tsx
import React from 'react';
import { ComplaintStatus, ComplaintCategory } from '@/types';
import { STATUS_CLASSES, CATEGORY_CLASSES } from '@/lib/utils';
import { Badge } from '@/components/ui';

export const StatusBadge: React.FC<{ status: ComplaintStatus }> = ({ status }) => (
  <Badge dot className={STATUS_CLASSES[status]}>
    {status}
  </Badge>
);

export const CategoryBadge: React.FC<{ category: ComplaintCategory }> = ({ category }) => (
  <Badge className={CATEGORY_CLASSES[category]}>
    {category}
  </Badge>
);