export interface AdminUserListItemDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;
}

export interface AdminUserListResponseDto {
  data: AdminUserListItemDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateUserStatusRequestDto {
  status: 'active' | 'suspended' | 'banned';
  reason: string;
  durationDays?: number;
}

export interface UpdateUserStatusResponseDto {
  userId: string;
  previousStatus: string;
  newStatus: string;
  effectiveUntil?: string;
  auditLogId: string;
}
