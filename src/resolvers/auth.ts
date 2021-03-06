import { getUserId } from '../utils';
import { User } from '../../db/entity';
import * as jwt from 'jsonwebtoken';
import { hashSync, compareSync } from 'bcryptjs';

interface AuthInput {
	name: string;
	password: string;
}

export const Query = {
	async me(p_, $, ctx) {
		return await User.findOne(getUserId(ctx));
	}
};

export const Mutation = {
	async login(_, args: { data: AuthInput }) {
		const user = await User.findOne({ name: args.data.name });
		if (!user) {
			throw Error('用户不存在');
		} else if (!compareSync(args.data.password, user.password)) {
			throw Error('密码错误');
		} else {
			return user;
		}
	},
	async userReset(_, args: { data: AuthInput }, ctx) {
		const user = await User.findOne(getUserId(ctx));
		user.name = args.data.name;
		user.password = hashSync(args.data.password);
		return await user.save();
	}
};

// 添加token
export const AuthPayLoad = {
	token(parent: User) {
		return jwt.sign({ id: parent.id }, process.env.APP_SECRET);
	},
	user(parent: User) {
		return parent;
	}
};
