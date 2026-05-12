import { useNavigate } from 'react-router-dom';
import { TableCell, TableRow } from '@/core/components/ui/table';
import { Button } from '@/core/components/ui/button';
import { ChevronRight } from 'lucide-react';
import type { AdminUserEntity } from '../../domain/entities/admin-user.entity';
import AdminUserStatusBadge from './AdminUserStatusBadge';
import routes from '@/core/constants/routes';

interface Props {
  user: AdminUserEntity;
  index: number;
}

export default function AdminUserRow({ user, index }: Props) {
  const navigate = useNavigate();

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <TableCell className="font-medium">
        {user.firstName} {user.lastName}
      </TableCell>
      <TableCell className="text-muted-foreground">{user.email}</TableCell>
      <TableCell>
        <span className="capitalize text-sm text-muted-foreground">
          {user.role}
        </span>
      </TableCell>
      <TableCell>
        <AdminUserStatusBadge status={user.status} />
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {user.createdAt.toLocaleDateString('fr-FR')}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            navigate(routes.adminUserDetail.replace(':id', user.id))
          }
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
