import React, { useState } from 'react';
import { Course, View } from '../types';
import { PlusCircle, Edit2, Trash2, Users } from 'lucide-react';

interface CoursesProps {
  courses: Course[];
  onCreate: () => void;
  onOpenCourse: (id: string) => void;
  onEditAssignments?: (courseId: string) => void;
  onDeleteCourse?: (courseId: string) => void;
}

const Courses: React.FC<CoursesProps> = ({ courses, onCreate, onOpenCourse, onEditAssignments, onDeleteCourse }) => {
  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Cursos</h2>
        <button
          onClick={onCreate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-bold text-background-dark shadow transition hover:-translate-y-0.5 sm:w-auto"
        >
          <PlusCircle className="w-5 h-5" /> Criar Novo Curso
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all group relative">
            <div className="aspect-video bg-gray-200 relative overflow-hidden cursor-pointer" onClick={() => onOpenCourse(course.id)}>
              <img src={course.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.title} />
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg">
                {course.category}
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 cursor-pointer" onClick={() => onOpenCourse(course.id)}>{course.title}</h3>
              <div className="w-full bg-gray-100 h-2 rounded-full mb-3">
                <div className="bg-primary h-2 rounded-full" style={{width: `${course.progress}%`}}></div>
              </div>
              <p className="text-sm text-gray-500 mb-4">{course.progress}% Concluído</p>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                {onEditAssignments && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAssignments(course.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-bold"
                    title="Gerenciar Atribuições"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Atribuir</span>
                  </button>
                )}
                {onDeleteCourse && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Tem certeza que deseja excluir o curso "${course.title}"?`)) {
                        onDeleteCourse(course.id);
                      }
                    }}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-bold"
                    title="Excluir Curso"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">Nenhum curso cadastrado</div>
        )}
      </div>
    </div>
  );
};

export default Courses;
