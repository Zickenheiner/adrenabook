export interface AdminUserEntity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'suspended' | 'banned';
  createdAt: Date;
}

export interface AdminUserListEntity {
  data: AdminUserEntity[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateUserStatusEntity {
  userId: string;
  previousStatus: string;
  newStatus: string;
  effectiveUntil?: Date;
  auditLogId: string;
}
