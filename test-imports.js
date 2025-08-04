// Test imports to verify services are working
import { incidentService } from './src/services/incidentService';
import { roleService } from './src/services/roleService';

console.log('Testing imports...');

console.log('incidentService:', typeof incidentService);
console.log('incidentService.createIncident:', typeof incidentService.createIncident);
console.log('incidentService.getAllIncidentsForHeatmap:', typeof incidentService.getAllIncidentsForHeatmap);

console.log('roleService:', typeof roleService);
console.log('roleService.getUserRole:', typeof roleService.getUserRole);

console.log('All imports successful!'); 