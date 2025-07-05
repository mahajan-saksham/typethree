import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card } from '../../components/Card';

const KycReview: React.FC = () => {
  return (
    <AdminLayout title="KYC Document Review">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-light">KYC Document Review</h1>
        </div>
        
        <Card variant="glass" padding="lg" className="backdrop-blur-xl mb-8">
          <div className="py-10 text-center">
            <h2 className="text-xl font-semibold text-light mb-4">Coming Soon</h2>
            <p className="text-light/60">
              KYC Document Review functionality will be implemented in the next phase.
            </p>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default KycReview;
