#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import Flask, render_template, send_from_directory, jsonify, request
import os
import json
from datetime import datetime

app = Flask(__name__, 
            static_folder='.',
            static_url_path='')

# 配置
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['JSON_AS_ASCII'] = False  # 支持中文JSON响应

# 模拟数据
def get_mock_hospitals():
    return [
        {
            "id": 1,
            "name": "北京协和医院",
            "description": "国家卫生健康委直属的三级甲等综合医院，是国家级医学中心和疑难重症诊治指导中心。",
            "level": "三甲",
            "location": "北京市东城区",
            "submitDate": "2024-01-15",
            "departmentCount": 45,
            "projectCount": 128
        },
        {
            "id": 2,
            "name": "上海交通大学医学院附属瑞金医院",
            "description": "集医疗、教学、科研为一体的三级甲等综合性医院，在血液学、内分泌等领域处于国际先进水平。",
            "level": "三甲",
            "location": "上海市黄浦区",
            "submitDate": "2024-01-20",
            "departmentCount": 38,
            "projectCount": 95
        },
        {
            "id": 3,
            "name": "四川大学华西医院",
            "description": "西部地区重要的医疗中心，在肿瘤学、神经外科等专业领域具有显著优势。",
            "level": "三甲",
            "location": "四川省成都市",
            "submitDate": "2024-01-25",
            "departmentCount": 42,
            "projectCount": 87
        },
        {
            "id": 4,
            "name": "中山大学附属第一医院",
            "description": "华南地区医疗、教学、科研和预防保健中心，多个学科在国内外享有盛誉。",
            "level": "三甲",
            "location": "广东省广州市",
            "submitDate": "2024-02-01",
            "departmentCount": 40,
            "projectCount": 76
        }
    ]

def get_mock_departments(hospital_id=None):
    departments = [
        {
            "id": 1,
            "name": "心血管内科",
            "description": "专业从事心血管疾病的诊断、治疗和研究，拥有先进的医疗设备和经验丰富的医疗团队。",
            "hospitalId": 1,
            "hospitalName": "北京协和医院",
            "director": "张主任",
            "memberCount": 25,
            "projectCount": 12,
            "submitDate": "2024-01-16",
            "tags": ["心脏病", "高血压", "心律失常"]
        },
        {
            "id": 2,
            "name": "神经外科",
            "description": "致力于颅脑疾病和脊髓疾病的外科治疗，在脑肿瘤、脑血管病等领域具有丰富经验。",
            "hospitalId": 1,
            "hospitalName": "北京协和医院",
            "director": "李主任",
            "memberCount": 18,
            "projectCount": 8,
            "submitDate": "2024-01-18",
            "tags": ["脑肿瘤", "脑血管病", "脊髓疾病"]
        },
        {
            "id": 3,
            "name": "血液科",
            "description": "专业治疗各种血液系统疾病，在白血病、淋巴瘤等恶性血液病治疗方面处于国内领先水平。",
            "hospitalId": 2,
            "hospitalName": "上海交通大学医学院附属瑞金医院",
            "director": "王主任",
            "memberCount": 22,
            "projectCount": 15,
            "submitDate": "2024-01-22",
            "tags": ["白血病", "淋巴瘤", "血液病"]
        }
    ]
    
    if hospital_id:
        return [dept for dept in departments if dept["hospitalId"] == int(hospital_id)]
    return departments

def get_mock_projects(department_id=None):
    projects = [
        {
            "id": 1,
            "title": "心血管疾病基因治疗研究",
            "description": "探索基因治疗在心血管疾病中的应用，开发新的治疗方法和药物靶点。",
            "leader": "张教授",
            "departmentId": 1,
            "departmentName": "心血管内科",
            "hospitalId": 1,
            "hospitalName": "北京协和医院",
            "status": "recruiting",
            "memberCount": 8,
            "maxMembers": 12,
            "startDate": "2024-03-01",
            "endDate": "2026-02-28",
            "tags": ["基因治疗", "心血管", "分子生物学"],
            "canJoin": True,
            "isJoined": False
        },
        {
            "id": 2,
            "title": "脑肿瘤精准治疗临床研究",
            "description": "基于分子标记物的脑肿瘤个性化治疗方案研究，提高治疗效果和患者生存质量。",
            "leader": "李教授",
            "departmentId": 2,
            "departmentName": "神经外科",
            "hospitalId": 1,
            "hospitalName": "北京协和医院",
            "status": "ongoing",
            "memberCount": 6,
            "maxMembers": 10,
            "startDate": "2024-01-15",
            "endDate": "2025-12-31",
            "tags": ["脑肿瘤", "精准医学", "临床研究"],
            "canJoin": True,
            "isJoined": False
        }
    ]
    
    if department_id:
        return [proj for proj in projects if proj["departmentId"] == int(department_id)]
    return projects

# 路由定义
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/admin')
def admin():
    return send_from_directory('.', 'admin.html')

# API路由
@app.route('/api/hospitals')
def api_hospitals():
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('pageSize', 6))
    search = request.args.get('search', '')
    
    hospitals = get_mock_hospitals()
    
    # 搜索过滤
    if search:
        hospitals = [h for h in hospitals if search.lower() in h['name'].lower()]
    
    # 分页
    total = len(hospitals)
    start = (page - 1) * page_size
    end = start + page_size
    hospitals_page = hospitals[start:end]
    
    return jsonify({
        "success": True,
        "data": hospitals_page,
        "pagination": {
            "current_page": page,
            "total_pages": (total + page_size - 1) // page_size,
            "total_count": total,
            "per_page": page_size
        }
    })

@app.route('/api/departments')
def api_departments():
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('pageSize', 6))
    search = request.args.get('search', '')
    hospital_id = request.args.get('hospital')
    
    departments = get_mock_departments(hospital_id)
    
    # 搜索过滤
    if search:
        departments = [d for d in departments if search.lower() in d['name'].lower()]
    
    # 分页
    total = len(departments)
    start = (page - 1) * page_size
    end = start + page_size
    departments_page = departments[start:end]
    
    return jsonify({
        "success": True,
        "data": departments_page,
        "pagination": {
            "current_page": page,
            "total_pages": (total + page_size - 1) // page_size,
            "total_count": total,
            "per_page": page_size
        }
    })

@app.route('/api/projects')
def api_projects():
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('pageSize', 6))
    search = request.args.get('search', '')
    department_id = request.args.get('department')
    
    projects = get_mock_projects(department_id)
    
    # 搜索过滤
    if search:
        projects = [p for p in projects if search.lower() in p['title'].lower() or search.lower() in p['leader'].lower()]
    
    # 分页
    total = len(projects)
    start = (page - 1) * page_size
    end = start + page_size
    projects_page = projects[start:end]
    
    return jsonify({
        "success": True,
        "data": projects_page,
        "pagination": {
            "current_page": page,
            "total_pages": (total + page_size - 1) // page_size,
            "total_count": total,
            "per_page": page_size
        }
    })

@app.route('/api/projects/<int:project_id>')
def api_project_detail(project_id):
    projects = get_mock_projects()
    project = next((p for p in projects if p["id"] == project_id), None)
    
    if project:
        return jsonify({
            "success": True,
            "data": project
        })
    else:
        return jsonify({
            "success": False,
            "message": "课题不存在"
        }), 404

@app.route('/api/projects/join', methods=['POST'])
def api_join_project():
    data = request.get_json()
    
    # 这里应该保存申请信息到数据库
    # 现在只是返回成功响应
    
    return jsonify({
        "success": True,
        "message": "申请已提交，请等待审核"
    })

# 静态文件路由
@app.route('/css/<path:filename>')
def css_files(filename):
    return send_from_directory('css', filename)

@app.route('/js/<path:filename>')
def js_files(filename):
    return send_from_directory('js', filename)

@app.route('/uploads/<path:filename>')
def uploaded_files(filename):
    return send_from_directory('uploads', filename)

# 错误处理
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500

if __name__ == '__main__':
    # 确保上传目录存在
    os.makedirs('uploads/images', exist_ok=True)
    os.makedirs('uploads/documents', exist_ok=True)
    os.makedirs('uploads/temp', exist_ok=True)
    
    # 启动应用
    app.run(host='0.0.0.0', port=9010, debug=False)
