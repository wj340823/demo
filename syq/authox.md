npm 安装（建议安装 cnpm 指定公司地址）

```
//cnpm指定公司npm库地址
cnpm config set registry http://192.168.80.51:7001

//全局安装
cnpm install @suc/authox -g

//或项目局部安装
cnpm install @suc/authox --S
```

在 main.js 里加上（样式可以自定义，改引用地址至自己的 sass 文件）

```
//引用authox自定义指令文件
import authox from '@suc/authox/plugins/authox-vue';

//引用authox权限模块的样式文件
import '@suc/authox/styles/authox.scss';

//注册自定义指令
Vue.use(authox,store);
```

在路由文件 router.js 子路由 children 里加上（页面都可以自定义，修改引用地址至自己写的文件）

```
{
    path: 'authox',
    meta: {
        name: 'authox'
    },
    component: () =>
        import ('@suc/authox/authox.vue'), //懒加载权限模块入口
    children: [{
            path: '',
            redirect: 'user',  //默认路由用户管理列表
        },
        {    //用户管理
            path: 'user',
            meta: {
                name: 'user'
            },
            component: () =>
                import ('@suc/authox/pages/user.vue'),
            children: [{
                path: '',
                redirect: 'userList',
            }, {
                path: 'userList',
                component: () =>
                    import ('@suc/authox/pages/user/userList.vue')
            }, {
                path: 'userEdit',
                component: () =>
                    import ('@suc/authox/pages/user/userEdit.vue')
            }]
        },
        {    //群主管理
            path: 'group',
            meta: {
                name: 'group'
            },
            component: () =>
                import ('@suc/authox/pages/group.vue'),
            children: [{
                path: '',
                redirect: 'groupList',
            }, {
                path: 'groupList',
                component: () =>
                    import ('@suc/authox/pages/group/groupList.vue')
            }, {
                path: 'groupEdit',
                component: () =>
                    import ('@suc/authox/pages/group/groupEdit.vue')
            }]
        },
        {    //角色管理
            path: 'role',
            meta: {
                name: 'role'
            },
            component: () =>
                import ('@suc/authox/pages/role.vue'),
            children: [{
                path: '',
                redirect: 'roleList',
            }, {
                path: 'roleList',
                component: () =>
                    import ('@suc/authox/pages/role/roleList.vue')
            }, {
                path: 'roleEdit',
                component: () =>
                    import ('@suc/authox/pages/role/roleEdit.vue')
            }]
        }
    ]
}
```

在页面加上路由即可直接访问

在需要添加权限的模块里面加上自定义指令

```
<Button type="text" v-authox="'authox|manage'"></Button>
```

注：不建议在 node_modules 里面直接改动文件，特别是在多人开发的时候。
