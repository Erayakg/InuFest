import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box
} from '@mui/material';
import axios from 'axios';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/v1/project', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setProjects(response.data.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Tüm Projeler
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Proje Adı</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Öğrenciler</TableCell>
                  <TableCell>Oluşturulma Tarihi</TableCell>
                  <TableCell>Güncellenme Tarihi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.id}</TableCell>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.description}</TableCell>
                    <TableCell>{project.category.name}</TableCell>
                    <TableCell>
                      {project.students.map(student => 
                        student.name + ' ' + student.surname
                      ).join(', ')}
                    </TableCell>
                    <TableCell>
                      {new Date(project.createDate).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell>
                      {new Date(project.updateDate).toLocaleDateString('tr-TR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectList; 