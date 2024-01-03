import { Schema, model } from 'mongoose';

import { IPointsManagement } from '../interfaces/pointsManagement/pointsManagements.interface';

const PointsMangementSchema = new Schema<IPointsManagement>({
  noOfPointsInOneUnit: Number,
  totalPointConversionForOneUnit: Number,
  min: Number,
  max: Number,
  status: { type: String, default: 'static' },
});

const PointsManagement = model('points', PointsMangementSchema);
export default PointsManagement;
